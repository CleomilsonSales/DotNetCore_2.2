using Microsoft.EntityFrameworkCore;

namespace ProAgil.API.Data
{
    public class DataContext : DbContext 
    {
        public DataContext(DbContextOptions<DataContext> options) : base(options){}
    
        public DbSet<Event> Eventos { get; set; }
    }
}